#!/bin/bash

kubectl config use-context dev-gcp

function get_secrets() {
  kubectl get secret -n tilbake -l app=burde-forstatt,type=azurerator.nais.io -o json | jq '.items[0].data | map_values(@base64d)'
}

BURDE_FORTSTATT_AZURE_SECRETS=$(get_secrets azuread-tilbakekreving-frontend-lokal)

if [ -z "$BURDE_FORTSTATT_AZURE_SECRETS" ]
then
      echo "Klarte ikke å hente miljøvariabler. Er du pålogget Naisdevice og google?"
      exit 1
fi

function copy_envvar() {
  echo "$1='$(echo $BURDE_FORTSTATT_AZURE_SECRETS | jq -r .$1)'"
}

# Write the variables into the .env file
cat << EOF > .login.env
# Denne filen er generert automatisk ved å kjøre \`hent-og-lagre-miljøvariabler.sh\`

`copy_envvar AZURE_APP_CLIENT_ID`
`copy_envvar AZURE_APP_JWK`
`copy_envvar AZURE_APP_WELL_KNOWN_URL`
`copy_envvar AZURE_OPENID_CONFIG_JWKS_URI`
`copy_envvar AZURE_OPENID_CONFIG_ISSUER`
`copy_envvar AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`
EOF
