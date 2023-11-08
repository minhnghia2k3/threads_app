"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}


export async function createThread({
    text, author, communityId, path
}: Params) {
    try {
        connectToDB();
        const createThread = await Thread.create({
            text,
            author,
            communityId: null,
        });

        // Update user model
        await User.findByIdAndUpdate(author,
            {
                $push: { threads: createThread._id }
            })

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error when creating thread: ${error}`)
    }
}

export async function fetchThread(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();

        // Calculate the number of posts to skip

        const skipAmount = (pageNumber - 1) * pageSize; // Skip : (${3} - 1) * 20 = 40

        // Fetch the non-parent => Real thread ( not comment )
        const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: "author", model: User })
            .populate({
                path: "children",
                populate: {
                    path: "author",
                    model: User,
                    select: "_id name image parentId"
                }
            })

        const totalPostCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })
        const posts = await postsQuery.exec();

        const isNext = totalPostCount > skipAmount + posts.length;

        return { posts, isNext }

    } catch (err: any) {
        throw new Error(`Error when fetch all threads! ${err.message}`)
    }
}
/**
 * @param id 
 * @returns 
 * 
    thread: [{
        _id, text, author, createdAt
        , children: [{
            _id, id, name, parentId, image
                , children: [{
                    _id, id, name, parentId, image
                 }]
             }]
        }]
 */
export async function fetchThreadById(id: string) {
    connectToDB();
    try {
        // TODO: Populate Community
        const thread = await Thread.findById(id)
            .populate({
                path: "author",
                select: "_id id name image",
                model: User
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        select: '_id id name parentId image',
                        model: User
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: "_id id name parentId image"
                        }
                    }
                ]
            }).exec();

        return thread
    } catch (err: any) {
        throw new Error(`Error when fetch thread! ${err.message}`)
    }
}
export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    connectToDB();
    try {
        // Find the original thread by its ID
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error(`Thread not found!`)
        }

        // Create new thread with comment
        const commentThread = await Thread.create({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        // Update the original thread to include the new comment
        originalThread.children.push(commentThread._id)

        // save the original thread
        await originalThread.save();

        revalidatePath(path);
    } catch (err: any) {
        throw new Error(`Error when comment to thread: ${err.message}`)
    }

}