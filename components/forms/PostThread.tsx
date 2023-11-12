"use client"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname, useRouter } from "next/navigation"
import { ThreadValidation } from "@/lib/validations/thread"
import { createThread } from "@/lib/actions/thread.actions"
// import { updateUser } from "@/lib/actions/user.actions"
import { useOrganization } from "@clerk/nextjs"

const PostThread = ({ userId }: { userId: string }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization();

    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: "",
            accountId: userId
        }
    });
    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({
            text: values.thread,
            author: values.accountId,
            communityId: organization ? organization.id : null,
            path: pathname
        })

        router.push('/')
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-10 flex flex-col justify-start gap-10 ">

                    <FormField
                        control={form.control}
                        name="thread"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-3">
                                <FormLabel className="text-base-semibold text-light-2 gap-3 w-full">
                                    Content
                                </FormLabel>
                                <FormControl className="">
                                    <Textarea
                                        rows={15}
                                        className="no-focus border border-dark-4 bg-dark-3 text-light-1"
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="bg-primary-500">Post thread</Button>
                </form>
            </Form>
        </>

    )
}

export default PostThread