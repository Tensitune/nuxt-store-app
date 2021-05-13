const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { AdminMiddleware } = require('../middleware')
const db = require('../db')

router.get('/', async (req, res) => {
  const categories = await db.find('categories')
  res.json({ status: 'success', data: categories })
})

router.post('/',
  AdminMiddleware,
  check('title').notEmpty(),
  check('icon').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.insert('categories', {
      title: req.body.title,
      icon: req.body.icon
    })

    res.json({ status: 'success' })
  }
)

router.put('/',
  AdminMiddleware,
  check('id').custom(async value => {
    const category = await db.findOne('categories', { id: value })
    if (!category) return Promise.reject(new Error('Такой категории не существует'))
  }),
  check('title').notEmpty(),
  check('icon').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.update('categories', req.body.id, {
      title: req.body.title,
      icon: req.body.icon
    })

    res.json({ status: 'success' })
  }
)

router.delete('/',
  AdminMiddleware,
  check('id').custom(async value => {
    const category = await db.findOne('categories', { id: value })
    if (!category) return Promise.reject(new Error('Такой категории не существует'))
  }),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.delete('categories', req.body.id)
    res.json({ status: 'success' })
  }
)

module.exports = router
