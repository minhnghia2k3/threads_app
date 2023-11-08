"use client";
import React from 'react'
import { CommentValidation } from '@/lib/validations/thread';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { addCommentToThread } from '@/lib/actions/thread.actions';

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string
}
const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
    const pathname = usePathname();
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: ""
        },
    })
    async function onSubmit(values: z.infer<typeof CommentValidation>) {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname)

        form.reset();
    }

    return (
        <div>
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
                    <FormField
                        control={form.control}
                        name="thread"
                        render={({ field }) => (
                            <FormItem className="flex w-full items-center gap-3">
                                <FormLabel>
                                    <Image
                                        src={currentUserImg}
                                        alt="Profile image"
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover" />
                                </FormLabel>
                                <FormControl className="border-none bg-dark-2">
                                    <Input type="text" placeholder="Comment..."
                                        className="no-focus text-light-1 outline-none"
                                        {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="comment-form_btn">Reply</Button>
                </form>
            </Form>
        </div>
    )
}

export default Comment