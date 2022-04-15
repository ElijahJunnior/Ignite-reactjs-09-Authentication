// REACT / NEXT
import { GetServerSideProps } from "next";
import { FormEvent, useContext, useState } from "react"

// COMPONENTS
import { AuthContext } from "../contexts/AuthContext";
import { WithSSRGest } from "../utils/WithSSRGest";

// STYLING
import styles from '../styles/Home.module.css';

export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {

    event.preventDefault();

    const data = {
      email,
      password
    };

    await signIn(data);

  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )

}

export const getServerSideProps = WithSSRGest(async (ctx) => {

  return {
    props: {}
  }

})