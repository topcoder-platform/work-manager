import { useEffect, useState } from 'react'
import { loadGroupDetails } from '../../../actions/challenges'

export const useMapSelectedGroups = (groupIds) => {
  const [selectedGroups, setSelectedGroups] = useState([])
  useEffect(() => {
    if (!groupIds || !groupIds.length) {
      setSelectedGroups([])
      return
    }

    loadGroupDetails(groupIds).then(res => {
      setSelectedGroups(res.map(d => ({ label: d.name, value: d.id })))
    })
  }, [groupIds])
  return selectedGroups
}
