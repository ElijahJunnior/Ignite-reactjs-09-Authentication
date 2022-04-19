// REACT / NEXT
import { useContext, useEffect } from "react"

// CONTEXTS
import { AuthContext } from "../contexts/AuthContext"

// SERVICES
import { api } from "../services/apiClient";
import { setupApiClient } from "../services/api";

// OTHERS
import { WithSSRAuth } from "../utils/WithSSRAuth";

export default function Dashboard() {

  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me')
      .then(response => response?.data)
      .catch(err => console.log(err));
  }, []);

  return (
    <h1>Dashboard {user?.email}</h1>
  )
}

export const getServerSideProps = WithSSRAuth(async (ctx) => {

  const apiClient = setupApiClient(ctx)

  const me = await apiClient.get('/me').then(res => res?.data || '');

  return {
    props: {

    }
  }

})