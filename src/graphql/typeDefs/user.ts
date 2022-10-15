import { gql } from "apollo-server-core";

const typeDefs = gql`
    scalar Date
    
    type User {
        id: String
        name: String
        username: String
        email: String
        emailVerified: Boolean
        image: String
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