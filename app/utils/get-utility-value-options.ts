import utilsConfig from '$utilsConfig'

export function getUtilityValueOptions() {
  return {
    formatFncByDataType: utilsConfig.dataTypeExtend.formatFncByDataType,
    parseFncByDataType: utilsConfig.dataTypeExtend.parseFncByDataType,
    useUtc: utilsConfig.general.useUtc,
  }
}
