; ModuleID = 'autocfg_c8f7f1af04aa5125_4.7c45ce5a37b5a27d-cgu.0'
source_filename = "autocfg_c8f7f1af04aa5125_4.7c45ce5a37b5a27d-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-i128:128-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

; autocfg_c8f7f1af04aa5125_4::probe
; Function Attrs: nounwind
define dso_local void @_ZN26autocfg_c8f7f1af04aa5125_45probe17h50379e1ea1332535E() unnamed_addr #0 {
start:
  %0 = alloca [4 x i8], align 4
  store i32 1, ptr %0, align 4
  %_0.i = load i32, ptr %0, align 4
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind speculatable willreturn memory(none)
declare i32 @llvm.cttz.i32(i32, i1 immarg) #1

attributes #0 = { nounwind "target-cpu"="mvp" "target-features"="+mutable-globals" }
attributes #1 = { nocallback nofree nosync nounwind speculatable willreturn memory(none) }

!llvm.ident = !{!0}

!0 = !{!"rustc version 1.87.0 (17067e9ac 2025-05-09)"}
