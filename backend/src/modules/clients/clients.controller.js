const clientsService = require('./clients.service');

/**
 * Crear cliente
 */
const createClient = async (req, res) => {
  try {
    const client = await clientsService.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    res.status(500).json({ message: 'Error creando cliente' });
  }
};

/**
 * Listar clientes
 */
const getClients = async (req, res) => {
  try {
    const clients = await clientsService.findAll();
    res.json(clients);
  } catch (error) {
    console.error('❌ Error listando clientes:', error);
    res.status(500).json({ message: 'Error listando clientes' });
  }
};

/**
 * Obtener cliente por ID
 */
const getClientById = async (req, res) => {
  try {
    const client = await clientsService.findById(req.params.id);
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
 * Obtener cliente por DNI
 */
const getClientByDni = async (req, res) => {
  try {
    const client = await clientsService.findByDni(req.params.dni);
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
