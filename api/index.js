'use restrict'

const { buildResponse } = require('./util')
const { getUserCredentials, saveProductDataBase, getResultById, getResults, deleteResultById, saveAcabDataBase, getAcabamentoByName } = require('./database')
const { authorize, createToken, makeHash } = require('./auth/auth')




function extractBody(event) {
  if (!event?.body) {
    return buildResponse(422, { error: 'Missing body' })
  }

  return JSON.parse(event.body)
}


module.exports.login = async (event) => {

  const { username, password } = extractBody(event);
  const hashedPass = makeHash(password)

  const user = await getUserCredentials(username, hashedPass)

  if (!user) {
    return buildResponse({ error: 'Invalid User!' })
  }

  return buildResponse(200, {
    token: createToken(username, user._id)
  })
}


module.exports.sendProduct = async (event) => {

  const authResult = await authorize(event)

  if (authResult.statusCode === 401) return authResult

  const acab = extractBody(event)
  const acabamento = await getAcabamentoByName(acab.acabamento)

  if (!acabamento) {
    return buildResponse(400, 'Acabamento não cadastrado!')
  }

  const sku = extractBody(event)

  const insertedId = await saveProductDataBase({ ...sku, acabamento })

  return buildResponse(201, {
    resultId: insertedId,
    __hypermedia: {
      href: `/results.html`,
      query: { acabamento }
    }
  })

}

module.exports.getResult = async (event) => {

  const authResult = await authorize(event)

  if (authResult.statusCode === 401) return authResult

  const result = await getResultById(event.pathParameters.id)


  if (!result) {
    return buildResponse(404, { error: 'Result not found!' })
  }
  return buildResponse(202, result)

}

module.exports.deletResult = async (event) => {

  const authResult = await authorize(event)

  if (authResult.statusCode === 401) return authResult

  const result = await deleteResultById(event.pathParameters.id)


  if (!result) {
    return buildResponse(404, { error: 'Result not found!' })
  }
  return buildResponse(202, "Item deletado com Sucesso!", result)

}


module.exports.getAllResults = async (event) => {

  const authResult = await authorize(event)

  if (authResult.statusCode === 401) return authResult

  const results = await getResults(event)


  if (!results) {
    return buildResponse(404, { error: 'Result not found!' })
  }
  return buildResponse(202, results)

};

module.exports.sendAcabamento = async (event) => {

  const authResult = await authorize(event)

  if (authResult.statusCode === 401) return authResult

  const sku = extractBody(event)

  const insertedId = await saveAcabDataBase(sku)

  return buildResponse(201, {
    resultId: insertedId,
    __hypermedia: {
      href: `/results.html`,
      query: { sku: sku }
    }
  })

}