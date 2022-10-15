import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import http from 'http';
import { getSession } from 'next-auth/react';
import { PrismaClient } from "@prisma/client";
import { PubSub } from 'graphql-subscriptions';
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import * as dotenv from 'dotenv';
import { GraphQlContext, Session, SubscriptionContext } from './types/type';

async function startApolloServer() {
    dotenv.config()

    const app = express();
    const httpServer = http.createServer(app);
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    })

    const corsOption = {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }

    const prisma = new PrismaClient()

    const pubsub = new PubSub();

    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        // Pass a different path here if your ApolloServer serves at
        // a different path.
        path: '/graphql/subscriptions',
    });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ 
        schema,
        context: async (ctx: SubscriptionContext): Promise<GraphQlContext> => {
            if (ctx.connectionParams && ctx.connectionParams.session) {
                const { session } = ctx.connectionParams

                return {
                    session,
                    prisma,
                    pubsub,
                }
            }
            return {
                session: null,
                prisma,
                pubsub,
            }
        } 
    }, wsServer);

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: async ({req, res}): Promise<GraphQlContext> => {
            const session = await getSession({ req })
            return {
                session: session as Session,
                prisma,
                pubsub,
            }
        },
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),
      
            // Proper shutdown for the WebSocket server.
            {
              async serverWillStart() {
                return {
                  async drainServer() {
                    await serverCleanup.dispose();
                  },
                };
              },
            },
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
    });
    await server.start();
    server.applyMiddleware({ app, cors: corsOption });
    await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer().catch((error) => console.log(error))