import { defineApp } from "@pipedream/types";
import { axios } from "@pipedream/platform";
import { Board, CreateTaskParams, HttpRequestParams } from "../common/types";
import { User } from "@sentry/node";
import { getOptionsDescription } from "../common/constants";

export default defineApp({
  type: "app",
  app: "kanbanflow",
  propDefinitions: {
    columnId: {
      label: "Column",
      description: getOptionsDescription('Column'),
      type: "string",
      async options() {
        return this.getBoardItems("columns");
      },
    },
    swimlaneId: {
      label: "Swimlane",
      description: getOptionsDescription('Swimlane'),
      type: "string",
      async options() {
        return this.getBoardItems("swimlanes");
      },
    },
    userId: {
      label: "Responsible User",
      description: getOptionsDescription('User'),
      type: "string",
      async options() {
        const users: User[] = await this.getUsers();
        return users.map(({ _id, fullName, email }) => ({
          label: `${fullName} (${email})`,
          value: _id,
        }));
      },
    },
  },
  methods: {
    _baseUrl(): string {
      return "https://kanbanflow.com/api/v1";
    },
    async _httpRequest({
      $ = this,
      endpoint,
      params,
      method = "GET",
      ...args
    }: HttpRequestParams): Promise<object> {
      return axios($, {
        url: this._baseUrl() + endpoint,
        params: {
          ...params,
          apiToken: this.$auth.api_token,
        },
        headers: {
          "Content-type": "application/jsom",
        },
        ...args,
      });
    },
    async getBoard(): Promise<Board> {
      return this._httpRequest({
        endpoint: "/board",
      });
    },
    async getUsers(): Promise<Board> {
      return this._httpRequest({
        endpoint: "/users",
      });
    },
    async getBoardItems(itemType: "columns" | "swimlanes") {
      const board: Board = await this.getBoard();
      return board[itemType].map(({ name: label, uniqueId: value }) => ({
        label,
        value,
      }));
    },
    async createTask(args: CreateTaskParams): Promise<object> {
      return this._httpRequest({
        endpoint: "/tasks",
        method: "POST",
        ...args,
      });
    },
  },
});