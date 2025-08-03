const scopes = [
	'create:self_service_profiles',
	'read:self_service_profiles',
	'update:self_service_profiles',
	'delete:self_service_profiles',
	'read:self_service_profile_custom_texts',
	'update:self_service_profile_custom_texts',
	'create:sso_access_tickets',
	'delete:sso_access_tickets'
]
const management = require('./Auth0')(scopes);

class Connection {
	constructor() {}

	static get profileId() { return 'ssp_mCRbWyWcT7UZ5SoMXqLULB' }
	static get genericIcon() { return 'https://raw.githubusercontent.com/WolbachAuth0/image-repo/main/public/connection.png?raw=true' }
	static get ticketPattern () {
		return new RegExp(`^https://${process.env.VITE_AUTH0_CUSTOM_DOMAIN}/self-service/connections-flow\\?ticket=[a-zA-Z0-9]+$`);
	}

	static computeName(display_name) {
		// result must match /^[a-zA-Z0-9-_]+$/
		const name = String(display_name)
			.trim()
			.replaceAll(/\s/, '_')
			.replaceAll(/[^a-zA-Z0-9-_]/, '-');
		return name
	}

	static ticketIdByURL(ticket_url) {
		return ticket_url.split('?ticket=')[1]
	}

	static ticketURLById(ticket_id) {
		// https://awol-self-service-sso.oktademo.site/self-service/connections-flow?ticket=rW1MP1fV08X7loZPExyEPMgXfAQq3DoD
		return `https://${process.env.VITE_AUTH0_CUSTOM_DOMAIN}/self-service/connections-flow?ticket=${ticket_id}`
	}

	static async getProfiles() {
		const response = await management.selfServiceProfiles.getAll()
		return response.data
	}

	static async getProfileByID(profileId) {
		const response = await management.selfServiceProfiles.get({ id: profileId })
		return response.data
	}

	static async revokeTicket(id) {
		const profileId = Connection.profileId
		const response = await management.selfServiceProfiles.revokeSsoTicket({ id, profileId });
		return response.data
	}

	static async createTicket(connection_config) {
		const id = Connection.profileId
		const ttl_sec = 3600
		const enabled_clients = [
			process.env.VITE_AUTH0_CLIENT_ID
		]
		const body = { connection_config, ttl_sec, enabled_clients }
		const response = await management.selfServiceProfiles.createSsoTicket({ id }, body)
		return response.data
	}

	static async deleteFromTenant (id) {
		const response = await management.connections.delete({ id });
		return response.data
	}
}

module.exports = Connection