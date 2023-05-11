/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  sendNumber: Scalars['Int'];
};


export type MutationSendNumberArgs = {
  prop: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  number: Scalars['Int'];
};


export type QueryNumberArgs = {
  prop: Scalars['Int'];
};

export type SendNumberMutationVariables = Exact<{
  prop: Scalars['Int'];
}>;


export type SendNumberMutation = { __typename?: 'Mutation', sendNumber: number };

export type GetNumberQueryVariables = Exact<{
  prop: Scalars['Int'];
}>;


export type GetNumberQuery = { __typename?: 'Query', number: number };


export const SendNumberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"sendNumber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prop"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendNumber"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prop"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prop"}}}]}]}}]} as unknown as DocumentNode<SendNumberMutation, SendNumberMutationVariables>;
export const GetNumberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getNumber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prop"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"prop"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prop"}}}]}]}}]} as unknown as DocumentNode<GetNumberQuery, GetNumberQueryVariables>;