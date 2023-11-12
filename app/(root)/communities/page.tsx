import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
const page = async () => {
    // Check user exist and onboarded
    const user = await currentUser();
    if (!user) return null;
    const userInfo = await fetchUser(user.id)
    if (!userInfo.onboardingStatus) redirect('/onboarding')

    const result = await fetchCommunities({
        searchString: "",
        pageNumber: 1,
        pageSize: 25,
    });


    return (
        <section>
            <h1 className="head-text mb-10">Communities</h1>

            {/* Search bar */}

            <div className="mt-14 flex flex-col gap-9">
                {result.communities.length === 0 ? (
                    <p className="no-result">No communities</p>
                ) : (
                    <>
                        {result.communities.map(community => (
                            <CommunityCard
                                key={community.id}
                                id={community.id}
                                imgUrl={community.image}
                                name={community.name}
                                username={community.username}
                                bio={community.bio}
                                members={community.members}
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default page