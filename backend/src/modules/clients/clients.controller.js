const clientsService = require('./clients.service');

/**
 * Crear cliente
 */
const createClient = async (req, res) => {
  try {
    const userId = req.user.id;
    const client = await clientsService.create(req.body, userId);
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    res.status(500).json({ message: 'Error creando cliente' });
  }
};

/**
 * Listar clientes (según rol)
 */
const getClients = async (req, res) => {
  try {
    const clients = await clientsService.findAllByUser(req.user);
    res.json(clients);
  } catch (error) {
    console.error('❌ Error listando clientes:', error);
    res.status(500).json({ message: 'Error listando clientes' });
  }
};

/**
 * Obtener cliente por ID (respeta visibilidad)
 */
const getClientById = async (req, res) => {
  try {
    const clients = await clientsService.findAllByUser(req.user);
    const client = clients.find(c => c.id === Number(req.params.id));

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('❌ Error obteniendo cliente:', error);
    res.status(500).json({ message: 'Error obteniendo cliente' });
  }
};

/**
 * Obtener cliente por DNI (respeta visibilidad)
 */
const getClientByDni = async (req, res) => {
  try {
    const clients = await clientsService.findAllByUser(req.user);
    const client = clients.find(c => c.dni === req.params.dni);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no existe' });
    }

    res.json(client);
  } catch (error) {
    console.error('❌ Error obteniendo cliente por DNI:', error);
    res.status(500).json({ message: 'Error obteniendo cliente' });
  }
};

/**
 * Actualizar cliente
 */
const updateClient = async (req, res) => {
  try {
    const clients = await clientsService.findAllByUser(req.user);
    const allowed = clients.some(c => c.id === Number(req.params.id));

    if (!allowed) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const client = await clientsService.update(req.params.id, req.body);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('❌ Error actualizando cliente:', error);
    res.status(500).json({ message: 'Error actualizando cliente' });
  }
};

/**
 * Desactivar cliente
 */
const deactivateClient = async (req, res) => {
  try {
    const clients = await clientsService.findAllByUser(req.user);
    const allowed = clients.some(c => c.id === Number(req.params.id));

    if (!allowed) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const client = await clientsService.deactivate(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente desactivado correctamente' });
  } catch (error) {
    console.error('❌ Error desactivando cliente:', error);
    res.status(500).json({ message: 'Error desactivando cliente' });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientById,
  getClientByDni,
  updateClient,
  deactivateClient
};