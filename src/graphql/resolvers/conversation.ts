const resolvers = {
    Mutation: {
        createConversation: async (
            _: any, 
            args: { usersList: string[] }, 
            context: any 
        ) => {
            const { usersList } = args
            console.log('test create conversation', usersList)
        }
    },
}

export default resolvers