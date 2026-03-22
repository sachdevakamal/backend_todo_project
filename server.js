import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { gql } from "graphql-tag";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

async function startApolloServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: gql`
      type Geo {
        lat: String
        lng: String
      }
      type Address {
        street: String
        suite: String
        city: String
        zipcode: String
        geo: Geo
      }
      type Company {
        name: String
        catchPhrase: String
        bs: String
      }
      type User {
        id: ID!
        name: String!
        email: String!
        address: Address
        phone: String
        website: String
        company: Company
      }
      type ToDo {
        id: ID!
        title: String
        description: String
        completed: Boolean
        user: User
      }
      type Query {
        getToDos: [ToDo]
        getAllUsers: [User]
      }
    `,
    resolvers: {
      ToDo: {
        user: async (todo) => {
          try {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`);
            return response.data;
          } catch (error) {
            console.error(error);
            return null;
          }
        }
      },
        
      Query: { 
        getToDos: async () => {
          try {
            const response = await axios.get("https://jsonplaceholder.typicode.com/todos");
            return response.data;
          } catch (error) {
            console.error(error);
            return [];
          }
        },
        getAllUsers: async () => {
          try {
            const response = await axios.get("https://jsonplaceholder.typicode.com/users");
            return response.data;
          } catch (error) {
            console.error(error);
            return [];
          }
        },
      },
    },
  });

  await server.start();

app.use(cors());
app.use(bodyParser.json());

  app.use("/graphql", expressMiddleware(server));

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

startApolloServer();
