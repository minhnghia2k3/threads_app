import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
async function Page() {
    const user = await currentUser();
    const userInfo = {}
    const userData = {
        id: user?.id,
        objectId: userInfo?._id,
        username: userInfo?.username || user?.username,
        name: userInfo?.name || user.firstName || "",
        bio: userInfo?.bio || "",
        image: userInfo?.image || user.imageUrl,
    }

    if (userInfo) redirect('/')
    return (
        <main className="mx-auto flex flex-col justify-start px-10 py-20 max-w-3xl">
            <h1 className="head-text">Onboarding</h1>
            <p className="mt-3 text-base-regular text-light-2">
                Complete your profile now to use Threads
            </p>
            <section className="mt-9 bg-dark-2 p-10">
                <AccountProfile user={userData} btnTitle="Continue" />
            </section>
        </main>
    )
}

export default Page;