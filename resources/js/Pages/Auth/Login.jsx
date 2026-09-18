import AuthBrand from '@/Components/Auth/AuthBrand';
import AuthField from '@/Components/Auth/AuthField';
import AuthSeparator from '@/Components/Auth/AuthSeparator';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion" />
            <main className="min-h-screen bg-[#0d0f0f] text-white">
                <section
                    className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-cover bg-bottom px-8 pb-8 pt-12"
                    style={{
                        backgroundImage:
                            "linear-gradient(180deg, rgba(5,6,6,.96) 0%, rgba(5,6,6,.95) 54%, rgba(5,6,6,.35) 100%), url('https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=90')",
                    }}
                >
                    <div className="flex justify-end">
                        <Link href={route('home')} className="text-sm font-medium text-white/90">
                            Retour au site
                        </Link>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <AuthBrand />
                    </div>

                    <div className="mt-8 text-center">
                        <h1 className="font-serif text-3xl">Bienvenue</h1>
                        <p className="mx-auto mt-2 max-w-[280px] text-sm leading-5 text-white/80">
                            Connectez-vous pour acceder a votre espace et suivre vos commandes.
                        </p>
                    </div>

                    {status && <div className="mt-4 rounded bg-emerald-500/15 p-3 text-sm text-emerald-100">{status}</div>}

                    <form onSubmit={submit} className="mt-7 space-y-4">
                        <AuthField
                            label="Telephone ou e-mail"
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            placeholder="Entrez votre telephone ou e-mail"
                            error={errors.email}
                            onChange={(event) => setData('email', event.target.value)}
                        />

                        <div className="rounded bg-white/95 p-3 text-xs font-bold text-[#17110b] shadow-sm">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password">Mot de passe</label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-[11px] font-bold">
                                        Mot de passe oublie ?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 h-10 w-full rounded border border-neutral-300 bg-white px-3 text-sm font-normal text-[#17110b] placeholder:text-neutral-400 focus:border-[#c99524] focus:ring-[#c99524]"
                                autoComplete="current-password"
                                placeholder="Entrez votre mot de passe"
                                onChange={(event) => setData('password', event.target.value)}
                            />
                            {errors.password && <p className="mt-2 text-xs font-semibold text-red-700">{errors.password}</p>}
                        </div>

                        <button disabled={processing} className="h-14 w-full rounded bg-[#d39a25] text-sm font-bold uppercase text-white shadow-lg disabled:opacity-60">
                            Se connecter
                        </button>
                    </form>

                    <AuthSeparator>Vous n'avez pas encore de compte ?</AuthSeparator>

                    <Link href={route('register')} className="h-12 rounded border border-[#d39a25] text-center text-sm font-bold uppercase leading-[48px] text-white">
                        Creer un compte
                    </Link>

                    <div className="mt-auto pb-8 pt-10">
                        <p className="max-w-[250px] font-serif text-3xl leading-tight">
                            Plus qu'un style, un etat d'esprit.
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[#d6a22a]">237 GENTLEMAN</p>
                    </div>
                </section>
            </main>
        </>
    );
}
