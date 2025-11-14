import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'cristalcar-secret-key-change-in-production'

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      perfil: user.perfil,
      permissoes: user.permissoes
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function checkPermission(modulo) {
  return (req, res, next) => {
    const { user } = req

    // Administradores têm acesso total
    if (user.perfil === 'admin') {
      return next()
    }

    // Verifica permissões específicas do módulo
    if (user.permissoes && user.permissoes[modulo]) {
      return next()
    }

    return res.status(403).json({ error: 'Acesso negado a este módulo' })
  }
}
