import React from 'react'
import { fetchUserPosts } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation';
import ThreadCard from '../cards/ThreadCard';
interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
    // TODO: Fetch Profile threads
    const result = await fetchUserPosts(accountId);
    if (!result) redirect('/')
    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread: any) => (
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={currentUserId}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={
                        accountType === "User"
                            ? { name: result.name, id: result.id, image: result.image }
                            : { name: thread.author.name, id: thread.author.id, image: thread.author.image }
                    } //todo
                    community={thread.community} //todo
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            ))}
        </section>
    )
}

export default ThreadsTab