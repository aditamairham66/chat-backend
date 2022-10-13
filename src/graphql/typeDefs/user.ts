import { gql } from "apollo-server-core";

const typeDefs = gql`
    type User {
        id: String
        username: String
    }

    type Query {
        searchUsername(username: String): [User]
    }

    type Mutation {
        createUsername(username: String): CreateUserResponse
    }

    type CreateUserResponse {
        success: Boolean
        error: String
    }
`

export default typeDefs