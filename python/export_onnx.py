import argparse
from pathlib import Path
import torch
from model import get_haem_model


def export_to_onnx(checkpoint_path: str | None, output_path: str, num_classes: int = 8) -> None:
    device = torch.device("cpu")
    model = get_haem_model(num_classes=num_classes, pretrained=checkpoint_path is None)

    if checkpoint_path and Path(checkpoint_path).exists():
        state_dict = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(state_dict)
        print(f"Loaded checkpoint weights from {checkpoint_path}")
    else:
        print("No checkpoint found; exporting initialized ResNet-18 architecture.")

    model.eval()

    # Standard 224x224 RGB input tensor expected by ResNet-18
    dummy_input = torch.randn(1, 3, 224, 224, device=device)

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    torch.onnx.export(
        model,
        dummy_input,
        str(out_file),
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "logits": {0: "batch_size"},
        },
    )
    print(f"Exported ONNX model to {out_file.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export HaemHelper ResNet-18 to ONNX")
    parser.add_argument("--checkpoint", type=str, default="haematology_production.pth")
    parser.add_argument("--out", type=str, default="../public/models/haem_resnet18.onnx")
    parser.add_argument("--classes", type=int, default=8)
    args = parser.parse_args()

    export_to_onnx(args.checkpoint, args.out, args.classes)