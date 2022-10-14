import { gql } from "apollo-server-core";

const typeDefs = gql`
    type Mutation {
        createConversation(usersList: [String]): CreateConversationResponse
    }

    type CreateConversationResponse {
        conversationId: String
    }
`

export default typeDefs