const { ApolloServer } = require("apollo-server");
const neo4j = require("neo4j-driver").v1;
const { makeAugmentedSchema } = require("neo4j-graphql-js");
const dotenv = require("dotenv");

// set environment variables from ../.env
dotenv.config();

const typeDefs = /* GraphQL */ `
type Company {
   name: String
   employees: [Speaker] @relation(name: "WORKS_FOR", direction: "IN")
}

type Speaker {
   name: String
   pic: String
   title: String
   worksFor: Company @relation(name: "WORKS_FOR", direction: "OUT")
   presents: [Session] @relation(name: "PRESENTS", direction: "OUT")
}

type Session {
   title: String
   description: String
   presentedBy: Speaker @relation(name: "PRESENTS", direction: "OUT")
}
`;

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */

const schema = makeAugmentedSchema({
  typeDefs
});

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USER,
    process.env.NEO4J_PASSWORD
  )
);


/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: { driver },
  schema: schema,
  introspection: true,
  playground: true
});

// Specify port and path for GraphQL endpoint
const port = process.env.GRAPHQL_LISTEN_PORT || 4001;

server.listen({port}, () => {
  console.log(`GraphQL server ready at http://localhost:${port}`);
});