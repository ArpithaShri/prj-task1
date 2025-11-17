// frontend-react/src/services/graphql.js
const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "http://localhost:5000/graphql";

export async function graphqlRequest(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

// ========== Queries ==========

export const GET_TASKS = `
  query GetTasks($completed: Boolean) {
    tasks(completed: $completed) {
      id
      title
      description
      completed
      createdAt
      updatedAt
      user {
        id
        username
      }
    }
  }
`;

export const GET_TASK = `
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      completed
      createdAt
      updatedAt
      user {
        id
        username
      }
    }
  }
`;

export const GET_NOTIFICATIONS = `
  query GetNotifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) {
      id
      type
      message
      read
      createdAt
      relatedTask {
        id
        title
      }
    }
  }
`;

export const GET_MESSAGES = `
  query GetMessages($room: String, $limit: Int) {
    messages(room: $room, limit: $limit) {
      id
      username
      content
      room
      createdAt
      user {
        id
        username
      }
    }
  }
`;

export const GET_ME = `
  query GetMe {
    me {
      id
      username
      role
    }
  }
`;

// ========== Mutations ==========

export const CREATE_TASK = `
  mutation CreateTask($title: String!, $description: String) {
    createTask(title: $title, description: $description) {
      id
      title
      description
      completed
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK = `
  mutation UpdateTask($id: ID!, $title: String, $description: String, $completed: Boolean) {
    updateTask(id: $id, title: $title, description: $description, completed: $completed) {
      id
      title
      description
      completed
      updatedAt
    }
  }
`;

export const DELETE_TASK = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
      message
    }
  }
`;

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
      count
    }
  }
`;