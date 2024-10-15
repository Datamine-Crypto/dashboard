import { Box, FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { ecosystemConfigs } from "../../../../configs/config.base";
import { Ecosystem, Layer, NetworkType } from "../../../../configs/config.common";
import React from "react";
import { switchNetwork } from "../../../web3/helpers";
import { getEcosystemConfig } from "../../../../configs/config";
import { commonLanguage } from "../../../web3/web3Reducer";

export const getNetworkDropdown = (ecosystem: Ecosystem, dispatch: React.Dispatch<any>) => {


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
					justify="flex-start"
					alignItems="center"
				>
					<Grid item style={{ lineHeight: 0 }}>
						<Box mr={1}><img src={ecosystemLogoSvg} width="24" height="24" /></Box>
					</Grid>
					<Grid item>
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
				onChange={e => {
					const targetEcosystem = e.target.value as Ecosystem
					const targetEcosystemConfig = getEcosystemConfig(targetEcosystem)

					switchNetwork(targetEcosystemConfig.layer === Layer.Layer2 ? '0xa4b1' : '0x1')

					dispatch({ type: commonLanguage.commands.UpdateEcosystem, payload: { ecosystem: targetEcosystem } })
					dispatch({ type: commonLanguage.commands.RefreshAccountState, payload: { forceRefresh: true } })

					//@todo this is a temporary hard-coded way to remember last item from the dropdown
					//@todo the downside to doing this is that if you go L2->L1 from ArbiFLux but don't finish if you refresh targetEcosystem would be defaulted to Lockquidity
					localStorage.setItem('targetEcosystem', targetEcosystem)

				}}
				label="Ecosystem"
			>
				{ecosystemMenuItems}
			</Select>
		</FormControl>
	</Box >
}