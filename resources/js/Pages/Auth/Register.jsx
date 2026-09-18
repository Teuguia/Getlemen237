import AuthBrand from '@/Components/Auth/AuthBrand';
import AuthField from '@/Components/Auth/AuthField';
import AuthSeparator from '@/Components/Auth/AuthSeparator';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Créer un compte" />
            <main className="min-h-screen bg-[#0d0f0f] text-white">
                <section className="mx-auto grid min-h-screen max-w-5xl lg:grid-cols-[1.05fr_.95fr]">
                    <div className="flex flex-col px-8 pb-8 pt-10">
                        <div className="flex justify-end">
                            <Link href={route('home')} className="text-sm font-medium text-white/90">
                                Retour au site
                            </Link>
                        </div>

                        <div className="mt-2 flex justify-center">
                            <AuthBrand compact />
                        </div>

                        <div className="mt-5 text-center">
                            <h1 className="font-serif text-3xl">Creer un compte</h1>
                            <p className="mx-auto mt-2 max-w-[320px] text-sm leading-5 text-white/80">
                                Rejoignez la communaute 237 Gentleman et profitez d'une experience personnalisee.
                            </p>
                        </div>

                        <form onSubmit={submit} className="mt-6 space-y-3">
                            <AuthField
                                label="Nom complet"
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                autoFocus
                                placeholder="Entrez votre nom complet"
                                error={errors.name}
                                onChange={(event) => setData('name', event.target.value)}
                            />

                            <AuthField
                                label="Telephone"
                                id="phone"
                                name="phone"
                                value={data.phone}
                                autoComplete="tel"
                                placeholder="Entrez votre numero de telephone"
                                error={errors.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                            />

                            <AuthField
                                label="E-mail"
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                placeholder="Entrez votre adresse e-mail"
                                error={errors.email}
                                onChange={(event) => setData('email', event.target.value)}
                            />

                            <AuthField
                                label="Mot de passe"
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                placeholder="Creez un mot de passe"
                                error={errors.password}
                                onChange={(event) => setData('password', event.target.value)}
                            />
                            <p className="-mt-1 text-xs text-white/70">Le mot de passe doit contenir au moins 8 caracteres.</p>

                            <AuthField
                                label="Confirmer le mot de passe"
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                placeholder="Saisissez a nouveau votre mot de passe"
                                error={errors.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                            />

                            <label className="flex items-start gap-3 text-xs leading-5 text-white/80">
                                <Checkbox
                                    name="terms"
                                    checked={data.terms}
                                    onChange={(event) => setData('terms', event.target.checked)}
                                />
                                <span>
                                    J'accepte les <span className="text-[#d6a22a]">Conditions d'utilisation</span> et la <span className="text-[#d6a22a]">Politique de confidentialite</span>.
                                </span>
                            </label>
                            <InputError message={errors.terms} />

                            <button disabled={processing} className="h-14 w-full rounded bg-[#d39a25] text-sm font-bold uppercase text-white shadow-lg disabled:opacity-60">
                                Creer mon compte
                            </button>
                        </form>

                        <AuthSeparator>Vous avez deja un compte ?</AuthSeparator>

                        <Link href={route('login')} className="h-12 rounded border border-[#d39a25] text-center text-sm font-bold uppercase leading-[48px] text-white">
                            Se connecter
                        </Link>
                    </div>

                    <aside
                        className="relative hidden bg-cover bg-center lg:block"
                        style={{
                            backgroundImage:
                                "linear-gradient(90deg, rgba(5,6,6,.65), rgba(5,6,6,.16)), url('https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=90')",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/25" />
                        <div className="relative flex h-full flex-col justify-center px-16">
                            <p className="max-w-[300px] font-serif text-4xl leading-tight">
                                L'elegance commence par le choix de mieux vivre.
                            </p>
                            <p className="mt-6 text-sm font-semibold text-[#d6a22a]">237 GENTLEMAN</p>
                        </div>
                    </aside>
                </section>
            </main>
        </>
    );
}
