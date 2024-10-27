const express = require('express')
const router = express.Router()
const Book = require('../models/books.model')
const { json } = require('body-parser')

/* MIDDLEWARE */
const getBook = async (req, res, next) => {
	let book
	const { id } = req.params

	if (!id.match(/^[0-9a-fA-F]{24}$/)) {
		return res.status(404).json({
			message: 'El ID del libro no es válido',
		})
	}

	try {
		book = await Book.findById(id)
		if (!book) {
			return res.status(404).json({
				message: 'El libro no fue encontrado',
			})
		}
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		})
	}

	res.book = book
	next()
}

/* Obtener todos los libros [GET ALL] */
router.get('/', async (req, res) => {
	try {
		const books = await Book.find()

		console.log('GET ALL', books)

		if (books.length == 0) {
			res.status(204).json([])
		}

		res.json(books)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
})

/* Crear un nuevo libro (recurso) [POST] */
router.post('/', async (req, res) => {
	const { title, author, genre, publication_date, original_language } = req?.body

	if (!title || !author || !genre || !publication_date || !original_language) {
		return res.status(400).json({
			message:
				'Los campos título, autor, género, fecha de publicación e idioma origina son obligatorios',
		})
	}

	const book = new Book({
		title,
		author,
		genre,
		publication_date,
		original_language,
	})

	try {
		const newBook = await book.save()
		res.status(201).json(newBook)
	} catch (error) {
		res.status(400).json({
			message: error.message,
		})
	}
})

/* Get individual [GET] */
router.get('/:id', getBook, async (req, res) => {
	res.json(res.book)
})

/* Update a book [PUT] */
router.put('/:id', getBook, async (req, res) => {
	try {
		const book = res.book

		book.title = req.body.title || book.title
		book.author = req.body.author || book.author
		book.genre = req.body.genre || book.genre
		book.publication_date = req.body.publication_date || book.publication_date
		book.original_language = req.body.original_language || book.original_language

		const updatedBook = await book.save()
		res.json(updatedBook)
	} catch (error) {
		res.status(400).json({
			message: error.message,
		})
	}
})

/* Patch a book [PATCH] */
router.patch('/:id', getBook, async (req, res) => {
	if (
		!req.body.title &&
		!req.body.author &&
		!req.body.genre &&
		!req.body.publication_date &&
		!req.body.original_language
	) {
		res.status(400).json({
			message:
				'Al menos uno de estos campos debe ser enviado: Título, Autor, Género, Fecha de publicación o Idioma original',
		})
	}
	try {
		const book = res.book

		book.title = req.body.title || book.title
		book.author = req.body.author || book.author
		book.genre = req.body.genre || book.genre
		book.publication_date = req.body.publication_date || book.publication_date
		book.original_language = req.body.original_language || book.original_language

		const updatedBook = await book.save()
		res.json(updatedBook)
	} catch (error) {
		res.status(400).json({
			message: error.message,
		})
	}
})

/* Delete a book [DELETE] */
router.delete('/:id', getBook, async (req, res) => {
	try {
		const book = res.book
		await book.deleteOne({
			_id: book._id,
		})
		res.json({
			message: `El libro ${book.title} ha sido borrado correctamente`,
		})
	} catch (error) {
		res.status(500).json({
			message: error.message,
		})
	}
})

module.exports = router
