const resolvers = {
    Query: {
        searchUsername: () => {}
    },
    Mutation: {
        createUsername: (_: any, args: { username: string }, context: any) => {
            const { username } = args
            console.log('test', username)
            console.log('context', context)
        }
    },
}

export default resolvers