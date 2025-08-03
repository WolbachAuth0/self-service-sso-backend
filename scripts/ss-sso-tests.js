const { join } = require('path');

// import the env variables FIRST - Before you do anything else
require('dotenv').config({ path: join(__dirname, './../../.env') });

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

// Docs ... https://auth0.github.io/node-auth0/classes/management.ManagementClient.html
const management = require('./../models/Auth0')(scopes)

main()

async function main () {
	console.log('calling main ...\n')
	const result = await getProfiles()
	const profileId = result[0].id
	// const profile = await getProfileByID({ id: profileId })
	
	const ticket = await createSSOTicket({ id: profileId });
	console.log(`SSO Ticket created for sso profile ${profileId}:`);
	console.log(ticket)

	const options = {
		id: ticket.ticket.split('?ticket=')[1],
		// id: 'h0c1cP3YU9ILcW7gzc2JWXG6x1b3QRI3',
		profileId
	}
	console.log(options)
	const revocation = await revokeSSOTicket(options)
	console.log(`ticket ${options.id} for sso profile ${options.profileId} revoked.`)
}

async function getProfiles () {
	const response = await management.selfServiceProfiles.getAll()
	return response.data
}

async function getProfileByID ({ id }) {
	const response = await management.selfServiceProfiles.get({ id })
	return response.data
}

// https://awol-self-service-sso.oktademo.site/self-service/connections-flow?ticket=rW1MP1fV08X7loZPExyEPMgXfAQq3DoD
async function createSSOTicket ({ id }) {
	const body = {
		// connection_id: "string", // If provided, this will allow editing of the provided connection during the SSO Flow
		connection_config: {
			name: "my-test-connection", // connection name.
			display_name: "My Test Connection", // Organization Displayname + connection
			is_domain_connection: false,
			show_as_button: false,
			metadata: {},
			options: {
				icon_url: 'https://raw.githubusercontent.com/WolbachAuth0/image-repo/main/public/connection.png?raw=true',
			}
		},
		enabled_clients: [
    		process.env.VITE_AUTH0_CLIENT_ID // enable the connection for the app client
		],
		// enabled_organizations: [
		// 	{
		// 		assign_membership_on_login: true, // boolean indicating whether the user should be automatically assigned to the organization upon login.
		// 		organization_id: '', // Organization identifier.
		// 		show_as_button: true // Determines whether a connection should be displayed on this organization’s login prompt. Only applicable for enterprise connections. Default: true.
		// 	}
		// ],
		ttl_sec: 3600, // Number of seconds for which the ticket is valid before expiration. If unspecified or set to 0, this value defaults to 432000 seconds (5 days).
		// domain_aliases_config: {
		// 	domain_verification: 'none'
		// },
	}
	const response = await management.selfServiceProfiles.createSsoTicket({ id }, body)
	return response.data

}

async function revokeSSOTicket ({ id, profileId }) {
	const response = await management.selfServiceProfiles.revokeSsoTicket({ id, profileId });
	return response.data
}