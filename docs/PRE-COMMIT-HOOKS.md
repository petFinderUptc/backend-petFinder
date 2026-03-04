# Guía de Pre-commit Hooks

## 📋 Descripción

Este proyecto utiliza **Husky** y **lint-staged** para ejecutar automáticamente validaciones de código antes de cada commit. Esto asegura que todo el código que se sube al repositorio cumple con los estándares de calidad establecidos.

## 🛠️ Herramientas Configuradas

### Husky
Administrador de Git hooks que permite ejecutar scripts automáticamente en diferentes momentos del flujo de trabajo de Git.

### lint-staged
Ejecuta linters solo en los archivos que están en el staging area, optimizando el tiempo de validación.

### ESLint
Analiza el código TypeScript en busca de errores de sintaxis, problemas de estilo y malas prácticas.

### Prettier
Formateador de código automático que asegura un estilo consistente en todo el proyecto.

## ⚙️ Configuración Actual

### Pre-commit Hook

Ubicación: `.husky/pre-commit`

```bash
npx lint-staged
```

### Tareas de lint-staged

Configuración en `package.json`:

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## 🎯 ¿Qué hace el pre-commit hook?

Cuando intentas hacer un commit, automáticamente:

1. **Identifica** los archivos TypeScript (*.ts) en staging
2. **Ejecuta ESLint** con auto-fix para corregir problemas detectables
3. **Ejecuta Prettier** para formatear el código
4. **Agrega los cambios** formateados al commit
5. **Completa el commit** si no hay errores

## 💡 Flujo de Trabajo

```bash
# 1. Modificas archivos
# 2. Agregas al staging
git add .

# 3. Intentas hacer commit
git commit -m "feat: nueva funcionalidad"

# 4. Husky ejecuta automáticamente:
#    ✓ ESLint analiza y corrige
#    ✓ Prettier formatea
#    ✓ Cambios se agregan automáticamente

# 5. Si todo está OK, el commit se completa
# 6. Si hay errores críticos, el commit se cancela
```

## 🚫 Errores Comunes

### Error: husky - pre-commit script failed

**Causa**: ESLint encontró errores que no puede auto-corregir.

**Solución**: 
```bash
# Ver los errores
npm run lint

# Corregir manualmente y volver a intentar
git add .
git commit -m "tu mensaje"
```

### Warning: LF will be replaced by CRLF

**Causa**: Diferencias de saltos de línea entre Windows y Unix.

**No requiere acción**: Git maneja esto automáticamente.

## 🔧 Scripts Disponibles

```bash
# Ejecutar ESLint manualmente
npm run lint

# Ejecutar Prettier manualmente
npm run format

# Ejecutar ambos en todo el proyecto
npm run lint && npm run format
```

## 📊 Ejemplo Práctico

### Antes del commit:
```typescript
const test   =    "mal formateado";
const otro=     'sin espacios';


function testFunction(  )  {
    console.log( test,otro )
}
```

### Después del commit:
```typescript
const test = 'mal formateado';
const otro = 'sin espacios';

function testFunction() {
  console.log(test, otro);
}
```

## ⏭️ Omitir Validaciones (No Recomendado)

En casos excepcionales, puedes omitir el pre-commit hook:

```bash
git commit -m "mensaje" --no-verify
```

⚠️ **Advertencia**: Usar `--no-verify` puede introducir código que no cumple con los estándares del proyecto.

## 🔄 Actualizar Configuración

### Cambiar reglas de ESLint
Edita `.eslintrc.js`

### Cambiar reglas de Prettier
Edita `.prettierrc`

### Modificar tareas de lint-staged
Edita la sección `lint-staged` en `package.json`

### Agregar nuevos hooks
```bash
# Pre-push hook
npx husky add .husky/pre-push "npm test"

# Commit-msg hook (para validar mensajes)
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## 📚 Recursos

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## ✅ Beneficios

✅ **Calidad consistente**: Todo el código sigue los mismos estándares

✅ **Reduce errores**: Detecta problemas antes de que lleguen al repositorio

✅ **Ahorra tiempo**: No más revisiones de código por formato

✅ **Automatización**: Los desarrolladores no tienen que recordar ejecutar linters

✅ **Code reviews más productivos**: Enfoque en lógica, no en estilo

## 🎓 Mejores Prácticas

1. **No omitas los hooks** a menos que sea absolutamente necesario
2. **Ejecuta linters localmente** antes de hacer staging si quieres ver los problemas
3. **Mantén las reglas actualizadas** según las necesidades del equipo
4. **Documenta excepciones** si necesitas desactivar reglas específicas
5. **Commits pequeños** para facilitar la validación

---

**Última actualización**: 2024
**Configurado por**: PetFinder Team
