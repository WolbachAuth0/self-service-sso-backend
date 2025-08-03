const { respond, handleError } = require('./../middleware/responseFormatter');
const Organization = require('./../models/Organization');

module.exports = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
}

async function getOrganizations(req, res) {
  try {
    const data = await Organization.getAll(req.query);
    const message = `Retrieved all organizations.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
};

async function getOrganizationById(req, res) {
  try {
    const { organization_id } = req.params;
    const organization = await Organization.getByID(organization_id);
    if (!organization) {
      return respond(req, res).notFound({ message: `Organization ${organization_id} not found.`})
    }

    const data = organization.toJSON()
    const message = `Retrieved organization with ID: ${organization_id}.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
};

async function createOrganization(req, res) {
  try {
    const organizationData = Organization.parseInput(req.body)
    const organization = new Organization(organizationData);
    const newOrganization = await organization.save();

    const data = newOrganization.toJSON();
    const message = `Created new organization.`;
    respond(req, res).created({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
};

async function updateOrganization(req, res) {
  try {
    const { organization_id } = req.params;
    const organizationData = req.body;
    const data = await Organization.update({ organization_id, organizationData });
    const message = `Updated organization with ID: ${organization_id}.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
};

async function deleteOrganization(req, res) {
  try {
    const { organization_id } = req.params;
    await Organization.delete({ organization_id });
    const message = `Deleted organization with ID: ${organization_id}.`;
    respond(req, res).noContent({ message });
  } catch (error) {
    handleError(req, res, error);
  }
};