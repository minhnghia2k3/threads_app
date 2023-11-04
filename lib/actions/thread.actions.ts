"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { skip } from "node:test";

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

    } catch (err) {

    }
}
