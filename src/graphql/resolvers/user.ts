import { User } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { CreateUserResponse, GraphQlContext } from "../../types/type"

const resolvers = {
    Query: {
        searchUsername: async (
            _: any, 
            args: { username: string }, 
            context: any 
        ): Promise<User[]> => {
            const { username: paramsUsername } = args
            const { session, prisma } = context


            if (!session?.user) {
                throw new ApolloError('Not Authorized')
            }

            const {
                user: {
                    username: authUsername
                }
            } = session

            try {
                const getUsers = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: paramsUsername,
                            not: authUsername,
                            mode: "insensitive",
                        }
                    }
                })

                return getUsers
            } catch (error: any) {
                throw new ApolloError(error.message)
            }
        }
    },
    Mutation: {
        createUsername: async ( 
            _: any, 
            args: { username: string }, 
            context: GraphQlContext 
        ): Promise<CreateUserResponse> => {
            const { username } = args
            const { session, prisma } = context


            if (!session?.user) {
                return {
                    error: 'Not Authorized'
                }
            }

            const { id: userId } = session.user

            try {   
                const find = await prisma.user.findUnique({
                    where: {
                        username
                    }
                })

                if (find) {
                    return {
                        error: 'Username is already taken.'
                    }
                }

                await prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        username
                    }
                })

                return {
                    success: true
                }
            } catch (error: any) {      
                return {
                    error: error.message
                }
            }
        }
    },
}

export default resolvers