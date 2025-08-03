const { respond, handleError } = require('./../middleware/responseFormatter');
const Connection = require('./../models/Connection');

module.exports = {
	createSSOTicket,
	revokeSSOTicketByURL,
  revokeSSOTicketByID,
	deleteConnection,
  validateTicketURL
}

async function createSSOTicket(req, res) {
  try {
    const display_name = req.body.display_name;
    const name = req.body?.name || Connection.computeName(display_name);
    const icon_url = req.body.icon_url || Connection.genericIcon;

    const connection_config = {
			name,
			display_name,
			is_domain_connection: false,
			show_as_button: true,
			metadata: {},
			options: {
				icon_url,
			}
		};
    
    const data = await Connection.createSSOTicket(connection_config);
    const message = `Self Service SSO ticket created.`;
    respond(req, res).created({ message, data});
  } catch (error) {
    handleError(req, res, error);
  }
};

async function revokeSSOTicketByURL (req, res) {
  try {
    const ticket_url = req.query?.ticket_url;
    const id = Connection.ticketIdByURL(ticket_url);
		const data = await Connection.revokeTicket(id);
    const message = `Self Service SSO ticket ${id} revoked.`;
    respond(req, res).ok({ message, data});
  } catch (error) {
    handleError(req, res, error);
  }
};

async function revokeSSOTicketByID (req, res) {
  try {
    const id = req.params?.ticket_id;
		const data = await Connection.revokeTicket(id);
    const message = `Self Service SSO ticket ${id} revoked.`;
    respond(req, res).ok({ message, data});
  } catch (error) {
    handleError(req, res, error);
  }
};

async function deleteConnection(req, res) {
  try {
    const id = req.params.connection_id;
    const data = await Connection.deleteFromTenant(id);
    const message = `Connection ${id} deleted from auth0 tenant.`;
    respond(req, res).ok({ message, data });
  } catch (error) {
    handleError(req, res, error);
  }
};

function validateTicketURL (req, res, next) {
  const ticket_url = req.query?.ticket_url;
  if (!ticket_url ) {
    return respond(req, res).badRequest({ message: 'Must provide ticket_url query parameter' });
  }
  const valid = Connection.ticketPattern.test(ticket_url)
  if (!valid) {
    return respond(req, res).badRequest({ message: 'ticket_url parameter was not a valid url.' })
  }
  next();
}