import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    sort: false,
    schema: "schema.graphql",
    documents: [
        "query/**/*.gql"
    ],
    ignoreNoDocuments: true,
    generates: {
        './gql/': {
            preset: 'client',
            config: {
                strictScalars: true,
            }
        }
    }
}

export default config