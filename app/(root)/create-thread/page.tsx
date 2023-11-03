import React from 'react'
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation"
import { fetchUser } from '@/lib/actions/user.actions';
import PostThread from '@/components/forms/PostThread';
const Page = async () => {
    const user = await currentUser();

    if (!user) return null;
    const userInfo = await fetchUser(user.id)
    if (!userInfo?.onboardingStatus) redirect("/onboarding")
    return (
        <>
            <h1 className="head-text">Create Threads</h1>
            <PostThread userId={userInfo._id.toString()} />
        </>
    )
}

export default Page