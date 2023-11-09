import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
const page = async () => {
    // Check user exist and onboarded
    const user = await currentUser();
    if (!user) return null;
    const userInfo = await fetchUser(user.id)
    if (!userInfo.onboardingStatus) redirect('/onboarding')

    // Fetch all the users
    const result = await fetchUsers({
        userId: user.id,
        searchString: "",
        pageNumber: 1,
        pageSize: 25,
    });


    return (
        <section>
            <h1 className="head-text mb-10">Search</h1>

            {/* Search bar */}

            <div className="mt-14 flex flex-col gap-9">
                {result.users.length === 0 ? (
                    <p className="no-result">No users</p>
                ) : (
                    <>
                        {result.users.map(person => (
                            <UserCard
                                key={person.id}
                                id={person.id}
                                imgUrl={person.image}
                                name={person.name}
                                username={person.username}
                                personType='User'
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    )
}

export default page