import { gql } from "apollo-server-core";

const typeDefs = gql`
    type Mutation {
        createConversation(usersList: [String]): CreateConversationResponse
    }

    type CreateConversationResponse {
        conversationId: String
    }

    type Conversation {
        id: String
        lastMessage: Message
        conversationParticipant: [Participant]
        createdAt: Date
        updatedAt: Date
    }

    type Participant {
        id: String
        user: User
        isRead: Boolean
    }

    type Query {
        conversations: [Conversation]
    }

    type Subscription {
        conversationCreated: Conversation
    }
`

export default typeDefs