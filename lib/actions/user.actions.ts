"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

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