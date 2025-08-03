const scopes = [
  'read:organizations',
  'update:organizations',
  'read:organization_members',
  'create:organization_member_roles',
  'read:organization_member_roles',
  'delete:organization_member_roles',
	'read:roles',
	
  'create:organization_connections',
  'read:organization_connections',
  'update:organization_connections',
  
  'create:organization_invitations',
  'read:organization_invitations',
  'delete:organization_invitations'
]
const management = require('./../models/Auth0')(scopes)

class Organization {
	constructor(data) {
		this._name = data?.name;
		this._display_name = data?.display_name;
		this._logo_url = data?.branding?.logo_url || 'https://cdn.auth0.com/manhattan/versions/1.6337.0/assets/badge.png';
		this._page_background = data?.branding?.colors?.page_background || `#000000`;
		this._primary = data?.branding?.colors?.primary || '#0059d6';
	}

	static async getEnabledConnections() {
		// return 'con_kLvOb4yzeBerRx0a' // Username-Password-Authentication (auth0 db connection)
		// return 'con_akDo7oGxm54PcNMD' // franchisezero-okta-idp okta enterprise connection
	}

	static async getByID(id) {
    try {
      const response = await management.organizations.get({ id })
      const organization = new Organization(response.data);
      organization.id = response.data.id;
      return organization
    } catch (error) {
      if (error.statusCode === 404) {
        return null; // organization not found
      }
      throw error; // rethrow other errors
    }
	}

	static async getAll(query) {
		const options = {
			page: query?.page || 1,
			per_page: query?.limit || 50
		}
		const response = await management.organizations.getAll(options);
		const data = response.data;
		return data
	}

	static async findByIdAndDelete(id) {
		const response = await management.organizations.delete({ id })
		if (!response.status == 204) {
			console.log(response)
		}
		return response.data
	}

	static async getAllRoles() {
		const response = await management.roles.getAll()
		return response.data
	}

	get id() { return this._id; }
	set id(value) { this._id = value }

	get organization_id() { return this._id; }

	get name() { return this._name; }
	set name(value) { this._name = value; }

	get display_name() { return this._display_name; }
	set display_name(value) { this._display_name = value; }

	get logo_url() { return this._logo_url; }
	set logo_url(value) { this._logo_url = value; }

	get primary() { return this._primary; }
	set primary(value) { this._primary = value; }

	get page_background() { return this._page_background; }
	set page_background(value) { this._page_background = value; }

	get colors() {
		return {
			primary: this._primary,
			page_background: this._page_background
		}
	}
	set colors({ primary, page_background }) {
		this._primary = primary;
		this._page_background = page_background;
	}

	get branding() {
		return {
			logo_url: this.logo_url,
			colors: this.colors
		}
	}
	set branding({ logo_url, colors }) {
		this._logo_url = logo_url;
		this.colors = colors;
	}

	// enabled_connections: [
	// 	{
	// 		connection_id: Organization.connection_id, // WARNING: hard-coded connection id
	// 		assign_membership_on_login: false,
	// 		// is_signup_enabled: true
	// 	}
	// ]

	toJSON() {
		return {
			organization_id: this.id,
			name: this.name,
			display_name: this.display_name,
			branding: this.branding,
		}
	}

	// acts as an Upsert
	update(data) {
		this.name = data?.name || this.name;
		this.display_name = data?.display_name || this.display_name;
		this.logo_url = data?.logo_url || this.logo_url;
		this.primary = data?.colors?.primary || this.primary;
		this.page_background = data?.colors?.page_background || this.page_background;
	}

	async addConnection ({ connection_id, assign_membership_on_login }) {
		const body = { connection_id, assign_membership_on_login }
		const response = await management.organizations.addEnabledConnection( { id: this.id }, body);
		return response.data
	}

	async removeConnection ({ connection_id, id }) {
		const response = await management.organizations.deleteEnabledConnection({ connection_id, id })
		return response.data
	}

	async save() {
		if (this.id) {
			// update organization by id
			const body = {
				name: this.name,
				display_name: this.display_name,
				branding: this.branding,
			}
			const response = await management.organizations.update({ id: this.id }, body);
			if (!response.status == 200) {
				console.log(response)
			}
		} else {
			// create new organization
			const body = {
				name: this.name,
				display_name: this.display_name,
				branding: this.branding,
				// enabled_connections: [
				// 	{
				// 		connection_id: Organization.connection_id,
				// 		assign_membership_on_login: false,
				// 		// is_signup_enabled: true
				// 	}
				// ]
			}
			const response = await management.organizations.create(body);
			if (!response.status == 201) {
				console.log(response)
			}
			this.id = response.data.id
		}
		return this
	}

	// invitations
	/**
	 * Send an invitation to a user by email to join an auth0 organization
	 * 
	 * @param {object} params
	 * @param {string} params.email The user email to invite
	 * @param {array} params.roles An array of role ids to assign to the invited user.
	 * @returns 
	 */
	async sendInvitation({ email, roles }) {
		const id = this.id
		const invitation = {
			inviter: {
				name: `${this.name} administrator`
			},
			invitee: {
				email
			},
			client_id: process.env.FRONTEND_AUTH0_CLIENT_ID,
			connection_id: Organization.connection_id,
			ttl_sec: 1814400, // 21 days
			roles,
			send_invitation_email: true
		}
		const response = await management.organizations.createInvitation({ id }, invitation)
		return response.data
	}

	async listInvitations() {
		const id = this.id
		const response = await management.organizations.getInvitations({ id })
		return response.data
	}

	async getInvitationById(invitation_id) {
		const id = this.id
		const response = await management.organizations.getInvitation({ id, invitation_id })
		return response.data
	}

	async deleteInvitationById(invitation_id) {
		const id = this.id
		const response = await management.organizations.deleteInvitation({ id, invitation_id })
		return response.data
	}

	async listMembers(query) {
		const options = {
			id: this.id,
			page: query?.page || 0,
			per_page: query?.limit || 50,
		}
		const response = await management.organizations.getMembers(options)
		return response.data
	}

	/**
	 * Get the roles assigned to an employee in the context of the franchise associated to
	 * this auth0 organization.
	 * 
	 * @param {*} user_id The employee auth0_id
	 */
	async readMemberRoles(auth0_id) {
		const id = this.id // organization_id
		const user_id = auth0_id
		const data = await management.organizations.getMemberRoles({ id, user_id })
	}

	async assignRolesToMember(auth0_id, roleIDs) {
		const id = this.id // organization_id
		const user_id = auth0_id

		// get the roles assigned to the user
		const existingRoles = await management.organizations.getMemberRoles({ id, user_id })

		// compare currently assigne roles to the role list in the update data
		// get a list of roles to add and a list of roles to delete.

		// add new roles
		const addedRoles = await management.organizations.addMemberRoles({ id, user_id }, newRoles)

		// delete 
		const data = await management.organizations.deleteMemberRoles({ id, user_id })

	}

}

module.exports = Organization