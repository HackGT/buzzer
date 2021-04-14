import mongoose from "mongoose";

import { MetaDataType, Status } from "./plugins/types";

const MONGO_URL = String(process.env.MONGO_URL);
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => {
  throw err;
});

interface RootDocument {
  _id: mongoose.Types.ObjectId;
}

export interface IMessage extends RootDocument {
  plugin: string;
  message: string;
  createdAt: Date;
  config: Partial<MetaDataType>;
  results: Status[];
}

const MessageSchema = new mongoose.Schema({
  plugin: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  config: {
    type: {
      subject: String,
      emails: [String],
      headerImage: String,

      title: String,
      icon: String,

      channels: [String],
      atChannel: Boolean,
      atHere: Boolean,
      userToken: String,

      numbers: [String],
      groups: [String],

      _: Boolean,

      header: String,
      id: String,

      area: String,
      text: String,
      time: String,
    },
  },
  results: {
    type: [
      {
        error: {
          type: Boolean,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
        message: {
          type: String,
        },
      },
    ],
    required: true,
  },
});

export const Message = mongoose.model<IMessage & mongoose.Document>("Message", MessageSchema);
