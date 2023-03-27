const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql')

const app = express()

// mock data from db
const authors = [
    { id: 1, name: 'JK' },
    { id: 2, name: 'JR' },
    { id: 3, name: 'Brent Weeks' },
]

const books = [
    { id: 1, name: 'HP1', authorId: 1 },
    { id: 2, name: 'HP2', authorId: 1 },
    { id: 3, name: 'HP3', authorId: 1 },
    { id: 4, name: 'The fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'Teh two towers', authorId: 2 },
    { id: 6, name: 'The return of the king', authorId: 2 },
    { id: 7, name: 'The way of shadows', authorId: 3 },
    { id: 8, name: 'Beyond the shadows', authorId: 3 },

]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'this represents an author of a book',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: author => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'this represents a book written by an author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: book => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Single Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'A Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a author',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        }

    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
})

app.use('/library', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(8000, () => { console.log('server running on port 8000!') })
