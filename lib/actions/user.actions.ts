"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import path from "path";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

// connect to mongodb
interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}


export async function updateUser({ userId,
    username,
    name,
    bio,
    image,
    path
}: Params
): Promise<void> {
    connectToDB();
    try {
        const existingUser = await User.findOne({ username: username.toLowerCase() })

        if (existingUser && existingUser.id !== userId) {
            throw new Error(`Username ${username} is already taken. Please choose a different username.`);
        }
        else {
            await User.findOneAndUpdate(
                { id: userId },
                {
                    username: username.toLowerCase(),
                    name,
                    bio,
                    image,
                    path,
                    onboardingStatus: true
                },
                { upsert: true } //update ( exists rows ) and insert ( non-exist rows)
            )
        }

        if (path === '/profile/edit')
            revalidatePath(path);
    } catch (err: any) {
        throw new Error(`Failed to create/update user: ${err.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();
        return await User.findOne({ id: userId })
        // .populate(
        //     {
        //         path:'communities',
        //         model: Community
        //     }
        // )
    }
    catch (err: any) {
        throw new Error(`Failed to fetch user ${err.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all threads author by user with the given userId
        // TODO: Populate community
        const threads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: {
                path: "children",
                model: Thread,
                populate: {
                    path: "author",
                    model: User,
                    select: "name image id"
                }
            }
        })
        return threads;
    } catch (err: any) {
        throw new Error(`Error when get users posts! ${err.message}`)
    }
}
/**
 *  PURPOSE: Get all users, not equal currentUserId, find depend on Regex
 *  Get max 20 records per page 
 */
export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}: {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder
}) {
    try {
        connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i") // insensitive: Không phân biệt hoa & thường

        // Fetching users
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        } // $ne: not equal

        // Searching by username or name depend on `regex`
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        // Sorting
        const sortOptions = { createdAt: sortBy }

        // query: not currentUserId, if have searchString => find depend on regex
        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query)
        const users = await usersQuery.exec();
        const isNext = totalUsersCount > users.length + skipAmount
        return { users, isNext }
    } catch (err: any) {
        throw new Error(`Error when fetch all users! ${err.message}`)
    }
}
/**
 * Concatenates child thread IDs from an array of user threads.
 * @param {Array} userThreads - Array of user thread objects with 'id' and 'children' properties.
 * @returns {Array} - Merged array containing all child thread IDs.
 */
export async function getActivity(userId: string) {
    try {
        connectToDB();

        // Find all threads created by the user
        const userThreads = await Thread.find({ author: userId })
        // Collect all the child thread ids (replies) from the 'children' field
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])
        // Get the replies (include in childThreadIds but not equal to userId)
        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId }
        }).populate({
            path: "author",
            model: User,
            select: "name image _id"
        })
        return replies;
    } catch (err: any) {
        throw new Error(`Failed to fetch activity: ${err.message}`)
    }
}
