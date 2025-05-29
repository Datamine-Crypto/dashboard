import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Grid from '@mui/material/Grid';
import React from "react";
import { getEcosystemConfig } from "../../../../configs/config";
import { ecosystemConfigs } from "../../../../configs/config.base";
import { Ecosystem, Layer } from "../../../../configs/config.common";
import { switchNetwork } from "../../../web3/helpers";
import { commonLanguage, ConnectionMethod } from "../../../web3/web3Reducer";

export const getNetworkDropdown = (ecosystem: Ecosystem, connectionMethod: ConnectionMethod, dispatch: React.Dispatch<any>) => {


	// All the known ecosystems will be iterated over
	const ecosystems = Object.entries(ecosystemConfigs);

	const ecosystemMenuItems = [];

	for (const [ecosystemName, ecosystemConfig] of ecosystems) {

		const { lockableTokenShortName, ecosystemLogoSvg, mintableTokenShortName, layer } = ecosystemConfig

		ecosystemMenuItems.push(
			<MenuItem value={ecosystemName}>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
				>
					<Grid style={{ lineHeight: 0 }}>
						<Box mr={1}><img src={ecosystemLogoSvg} width="24" height="24" /></Box>
					</Grid>
					<Grid>
						{lockableTokenShortName} → {mintableTokenShortName}
					</Grid>
				</Grid>
			</MenuItem>
		)
	}

	return <Box mr={1}>
		<FormControl size="small" variant="outlined" fullWidth style={{ width: 260 }} >
			<InputLabel id="network-type">Ecosystem</InputLabel>
			<Select
				labelId="network-type"
				value={ecosystem}
				onChange={async (e) => {
					const targetEcosystem = e.target.value as Ecosystem
					const targetEcosystemConfig = getEcosystemConfig(targetEcosystem)

					await switchNetwork(targetEcosystem, connectionMethod, targetEcosystemConfig.layer === Layer.Layer2 ? '0xa4b1' : '0x1')
					localStorage.setItem('targetEcosystem', targetEcosystem)

					dispatch({ type: commonLanguage.commands.ReinitializeWeb3, payload: { targetEcosystem } })

					//dispatch({ type: commonLanguage.commands.RefreshAccountState, payload: { forceRefresh: true } })

					//@todo this is a temporary hard-coded way to remember last item from the dropdown
					//@todo the downside to doing this is that if you go L2->L1 from ArbiFLux but don't finish if you refresh targetEcosystem would be defaulted to Lockquidity


				}}
				label="Ecosystem"
			>
				{ecosystemMenuItems}
			</Select>
		</FormControl>
	</Box >
}