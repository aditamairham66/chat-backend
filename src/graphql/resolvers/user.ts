import { CreateUserResponse, GraphQlContext } from "../../types/type"

const resolvers = {
    Query: {
        searchUsername: () => {}
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