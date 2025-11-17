export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    role: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type Notification {
    id: ID!
    user: User!
    type: String!
    message: String!
    read: Boolean!
    relatedTask: Task
    createdAt: String!
  }

  type Message {
    id: ID!
    user: User!
    username: String!
    content: String!
    room: String!
    createdAt: String!
  }

  type AuthPayload {
    message: String!
    user: User
  }

  type Query {
    # User queries
    me: User
    
    # Task queries
    tasks(completed: Boolean): [Task!]!
    task(id: ID!): Task
    
    # Notification queries
    notifications(unreadOnly: Boolean): [Notification!]!
    
    # Message queries
    messages(room: String, limit: Int): [Message!]!
  }

  type Mutation {
    # Task mutations
    createTask(title: String!, description: String): Task!
    updateTask(id: ID!, title: String, description: String, completed: Boolean): Task!
    deleteTask(id: ID!): DeleteResponse!
    
    # Notification mutations
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: BulkUpdateResponse!
    deleteNotification(id: ID!): DeleteResponse!
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  type BulkUpdateResponse {
    success: Boolean!
    message: String!
    count: Int!
  }
`;
// backend/graphql/typeDefs.js