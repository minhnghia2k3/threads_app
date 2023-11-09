import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {
    // Check user exist and onboarded
    const user = await currentUser();
    if (!user) return null;
    const userInfo = await fetchUser(user.id)
    if (!userInfo.onboardingStatus) redirect('/onboarding')

    // get activity
    const activities = await getActivity(userInfo._id)
    return (
        <section>
            <h1 className="head-text mb-10">Activity</h1>
            <section className="mt-10 flex flex-col gap-5">
                {activities.length > 0 ? (
                    <>
                        {activities.map(activity => (
                            <Link key={activity.id}
                                href={`/thread/${activity.parentId}`}>
                                <article className="activity-card">
                                    <Image src={activity.author.image}
                                        alt="Profile picture"
                                        width={20}
                                        height={20}
                                        className="rounded-full object-contain" />
                                    <p className="!text-small-regular text-light-1">
                                        <span className="mr-1 text-primary-500">
                                            {activity.author.name}
                                        </span>{" "}
                                        replied to your thread
                                    </p>
                                </article>
                            </Link>
                        ))}
                    </>
                ) : (
                    <p className="!text-base-regular text-light-3">No activity yet</p>
                )}
            </section>
        </section>
    )
}

export default page