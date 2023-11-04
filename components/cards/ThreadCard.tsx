import React from 'react'

interface Props {
    key: string;
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    };
    community: {
        name: string,
        id: string,
        image: string
    } | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
        }
    }[] // can have multiple comments
    isComment?: boolean;
}

const ThreadCard = ({
    key,
    id,
    currentUserId,
    parentId,
    content,
    author,
    community,
    createdAt,
    comments
}: Props) => {
    return (
        <article>
            <h2 className="text-small-regular text-light-2">
                {content}
            </h2>
        </article>
    )
}

export default ThreadCard