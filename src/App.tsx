import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Tipo = "SAL" | "PERIZIE" | "ALTRO";
type Stato = "todo" | "doing" | "done";

interface Attività {
  id: number;
  titolo: string;
  descrizione: string;
  progetto: string;
  tipo: Tipo;
  stato: Stato;
  priorità: "alta" | "media" | "bassa";
}

interface Progetto {
  id: number;
  nome: string;
}

interface Utente {
  nome: string;
  ruolo: "OPERAIO" | "UMARELL";
}

export default function App() {
  const [tab, setTab] = useState("tasks");
  const [utente, setUtente] = useState<Utente>({ nome: "Anonimo", ruolo: "UMARELL" });
  const [progetti, setProgetti] = useState<Progetto[]>(() => JSON.parse(localStorage.getItem("progetti") || "[]"));
  const [attività, setAttività] = useState<Attività[]>(() => JSON.parse(localStorage.getItem("attività") || "[]"));
  const [nuovoProgetto, setNuovoProgetto] = useState("");
  const [nuovoTitolo, setNuovoTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [tipo, setTipo] = useState<Tipo>("ALTRO");
  const [progetto, setProgetto] = useState("");
  const [priorità, setPriorità] = useState<"alta" | "media" | "bassa">("media");
  const [stato, setStato] = useState<Stato>("todo");

  // salvataggio su localStorage
  useEffect(() => {
    localStorage.setItem("progetti", JSON.stringify(progetti));
    localStorage.setItem("attività", JSON.stringify(attività));
  }, [progetti, attività]);

  const aggiungiProgetto = () => {
    if (!nuovoProgetto.trim()) return;
    const nuovo: Progetto = { id: Date.now(), nome: nuovoProgetto.trim() };
    setProgetti([...progetti, nuovo]);
    setNuovoProgetto("");
  };

  const aggiungiAttività = () => {
    if (!nuovoTitolo.trim()) return;
    const nuova: Attività = {
      id: Date.now(),
      titolo: nuovoTitolo.trim(),
      descrizione,
      progetto,
      tipo,
      stato,
      priorità
    };
    setAttività([...attività, nuova]);
    setNuovoTitolo("");
    setDescrizione("");
    setTipo("ALTRO");
    setProgetto("");
    setPriorità("media");
    setStato("todo");
  };

  const aggiornaStato = (id: number, nuovoStato: Stato) => {
    if (utente.ruolo === "UMARELL") return;
    setAttività(attività.map(a => (a.id === id ? { ...a, stato: nuovoStato } : a)));
  };

  const eliminaAttività = (id: number) => {
    if (utente.ruolo === "UMARELL") return;
    setAttività(attività.filter(a => a.id !== id));
  };

  const statistiche = progetti.map(p => {
    const delProgetto = attività.filter(a => a.progetto === p.nome);
    const fatte = delProgetto.filter(a => a.stato === "done").length;
    const tot = delProgetto.length;
    const inCorso = delProgetto.filter(a => a.stato !== "done").length;
    return { progetto: p.nome, fatte, inCorso, tot };
  });

  const cambiaUtente = (nome: string, ruolo: "UMARELL" | "OPERAIO") => {
    setUtente({ nome, ruolo });
  };

  const èOPERAIO = utente.ruolo === "OPERAIO";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🏗️ Contea · Gestione attività</h1>
          <div className="flex items-center space-x-3">
            <Select onValueChange={v => setUtente({ ...utente, ruolo: v as any })} value={utente.ruolo}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERAIO">👷 Operaio</SelectItem>
                <SelectItem value="UMARELL">🧓 Umarell</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-[160px]"
              placeholder="Nome utente"
              value={utente.nome}
              onChange={e => setUtente({ ...utente, nome: e.target.value })}
            />
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">📋 Piano di lavoro</TabsTrigger>
            <TabsTrigger value="report">📊 Report progetti</TabsTrigger>
            {èOPERAIO && <TabsTrigger value="utenti">👥 Utenti</TabsTrigger>}
          </TabsList>

          {/* --- Scheda Attività --- */}
          <TabsContent value="tasks">
            {èOPERAIO && (
              <Card className="mb-6">
                <CardContent className="p-4 space-y-3">
                  <h2 className="font-semibold">Aggiungi attività</h2>
                  <div className="flex flex-wrap gap-3">
                    <Input placeholder="Titolo" value={nuovoTitolo} onChange={e => setNuovoTitolo(e.target.value)} />
                    <Input placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} />
                    <Select onValueChange={v => setTipo(v as Tipo)} value={tipo}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAL">SAL</SelectItem>
                        <SelectItem value="PERIZIE">PERIZIE</SelectItem>
                        <SelectItem value="ALTRO">ALTRO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={v => setProgetto(v)} value={progetto}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Progetto" /></SelectTrigger>
                      <SelectContent>
                        {progetti.map(p => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select onValueChange={v => setPriorità(v as any)} value={priorità}>
                      <SelectTrigger className="w-[120px]"><SelectValue placeholder="Priorità" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="bassa">Bassa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={aggiungiAttività}>➕ Aggiungi</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {attività.map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{a.titolo}</h3>
                      <p className="text-sm text-gray-500">{a.descrizione}</p>
                      <div className="flex gap-2 mt-2">
                        {a.tipo && <Badge>{a.tipo}</Badge>}
                        {a.priorità === "alta" && <Badge variant="destructive">Alta</Badge>}
                        {a.priorità === "media" && <Badge>Media</Badge>}
                        {a.priorità === "bassa" && <Badge variant="outline">Bassa</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {èOPERAIO && (
                        <Select onValueChange={v => aggiornaStato(a.id, v as Stato)} value={a.stato}>
                          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Stato" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">Da fare</SelectItem>
                            <SelectItem value="doing">In corso</SelectItem>
                            <SelectItem value="done">Completata</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {!èOPERAIO && (
                        <Badge>{a.stato === "done" ? "Completata" : a.stato === "doing" ? "In corso" : "Da fare"}</Badge>
                      )}
                      {èOPERAIO && (
                        <Button variant="destructive" onClick={() => eliminaAttività(a.id)}>🗑️</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* --- Scheda Report --- */}
          <TabsContent value="report">
            <h2 className="text-xl font-semibold mb-3">📊 Stato dei progetti</h2>
            {statistiche.map(s => (
              <Card key={s.progetto} className="mb-3">
                <CardContent className="p-4 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{s.progetto}</h3>
                    <p className="text-sm text-gray-500">
                      In corso: {s.inCorso} · Completate: {s.fatte} · Totale: {s.tot}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* --- Scheda Utenti --- */}
          {èOPERAIO && (
            <TabsContent value="utenti">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h2 className="font-semibold">👥 Gestione utenti</h2>
                  <p className="text-sm text-gray-500">In questa versione le utenze si simulano localmente. Il profilo corrente può cambiare ruolo per testare i permessi (Umarell = sola lettura, Operaio = modifica completa).</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* --- Gestione Progetti --- */}
        {èOPERAIO && (
          <div className="mt-8">
            <h2 className="font-semibold mb-2">📁 Aggiungi progetto</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Nome progetto"
                value={nuovoProgetto}
                onChange={e => setNuovoProgetto(e.target.value)}
              />
              <Button onClick={aggiungiProgetto}>Aggiungi</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {progetti.map(p => <Badge key={p.id}>{p.nome}</Badge>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

