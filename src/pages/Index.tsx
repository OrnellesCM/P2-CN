import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Upload, CheckCircle2, XCircle } from "lucide-react";

const formSchema = z.object({
  nome_completo: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  usuario_acesso: z
    .string()
    .min(4, "Usuário deve ter pelo menos 4 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Usuário deve conter apenas letras, números e underscore"),
  senha: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter letras maiúsculas, minúsculas e números"),
  email_aluno: z
    .string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  observacao: z
    .string()
    .max(500, "Observação deve ter no máximo 500 caracteres")
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const Index = () => {
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande! Máximo 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Arquivo deve ser uma imagem");
        return;
      }
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nome_completo', data.nome_completo);
      formData.append('usuario_acesso', data.usuario_acesso);
      formData.append('senha', data.senha);
      formData.append('email_aluno', data.email_aluno);
      if (data.observacao) formData.append('observacao', data.observacao);
      if (foto) formData.append('foto', foto);

      const response = await fetch("http://localhost:3000/api/alunos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensagem || 'Erro ao cadastrar');
      }

      const result = await response.json();
      console.log('Aluno cadastrado:', result);

      toast.success("Aluno cadastrado com sucesso!", {
        description: `${data.nome_completo} foi registrado no sistema.`,
        icon: <CheckCircle2 className="h-5 w-5" />,
      });

      // Limpar formulário
      reset();
      setFoto(null);
      setFotoPreview("");
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      toast.error("Erro ao cadastrar aluno", {
        description: "Tente novamente mais tarde ou contate o suporte.",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Cadastro de Alunos</h1>
          <p className="text-muted-foreground">Preencha os dados abaixo para registrar um novo aluno</p>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Informações do Aluno</CardTitle>
            <CardDescription>Todos os campos marcados com * são obrigatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  placeholder="Ex: João Silva Santos"
                  {...register("nome_completo")}
                  className={errors.nome_completo ? "border-destructive" : ""}
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">{errors.nome_completo.message}</p>
                )}
              </div>

              {/* Usuário de Acesso */}
              <div className="space-y-2">
                <Label htmlFor="usuario_acesso">Usuário de Acesso *</Label>
                <Input
                  id="usuario_acesso"
                  placeholder="Ex: joao_silva"
                  {...register("usuario_acesso")}
                  className={errors.usuario_acesso ? "border-destructive" : ""}
                />
                {errors.usuario_acesso && (
                  <p className="text-sm text-destructive">{errors.usuario_acesso.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 8 caracteres com maiúsculas, minúsculas e números"
                  {...register("senha")}
                  className={errors.senha ? "border-destructive" : ""}
                />
                {errors.senha && (
                  <p className="text-sm text-destructive">{errors.senha.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email_aluno">Email *</Label>
                <Input
                  id="email_aluno"
                  type="email"
                  placeholder="Ex: joao.silva@email.com"
                  {...register("email_aluno")}
                  className={errors.email_aluno ? "border-destructive" : ""}
                />
                {errors.email_aluno && (
                  <p className="text-sm text-destructive">{errors.email_aluno.message}</p>
                )}
              </div>

              {/* Foto */}
              <div className="space-y-2">
                <Label htmlFor="foto">Foto do Aluno</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Máximo 5MB - JPG, PNG ou WEBP</p>
                  </div>
                  {fotoPreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Observação */}
              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  placeholder="Informações adicionais sobre o aluno..."
                  {...register("observacao")}
                  className={errors.observacao ? "border-destructive" : ""}
                  rows={4}
                />
                {errors.observacao && (
                  <p className="text-sm text-destructive">{errors.observacao.message}</p>
                )}
              </div>

              {/* Botão de Envio */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Cadastrar Aluno
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
